import re, random, os, json
import pandas as pd
import numpy as np
import scipy as sp
import seaborn as sns
from bokeh import mpl
from bokeh.plotting import output_file, show
from sklearn.feature_extraction.text import TfidfVectorizer
from classifier import Classifier, label2domain, manifestolabels

MANIFESTO_FOLDER = "data/wahlprogramme/"
RESULT_FOLDER = "data/resultate/"

# Tuples with party names, files and plotting colors
partyFiles = [
    ('AfD',"afd.md", "blue"),
    ('CDU/CSU', "cducsu.md", "gray"),
    ('FDP', "fdp.md", "yellow"),
    ('SPD', "spd.md", "red"),
    ('Grüne', "diegruenen.md", "green"),
    ('Die Linke', "dielinke.md", "purple")
    ]

# political domains (according to manifestocodes) to be analysed
domains = [
    'External Relations',
    'Freedom and Democracy',
    'Political System',
    'Economy',
    'Welfare and Quality of Life',
    'Fabric of Society'
    ]

def clean_whitespace(txt):
    '''
    Replaces multiple whitespaces by blank
    '''
    return re.sub("\s+"," ",txt)

def read_md(fn, min_len=100):
    '''
    Reads manifesto from md file;
    text segments shorter than min_len are discarded
    '''
    # uncomment next line for sentence segmentation
    # split_symbol = '[\.\!\?\;] '#
    # this splits texts per paragraph, marked by one or more '#'
    split_symbol = '#+'
    md_text = open(fn).read()
    len_filter = lambda x: len(x) > min_len
    text_segments = re.split(split_symbol,md_text)
    texts = filter(len_filter, map(clean_whitespace, text_segments))
    return texts

def classify_br(folder, fn, party, clf, max_txts=10000):
    '''
    Computes predictions for a given party
    INPUT:
    folder      folder where [party].md files are stored
    fn          filename of [party].md file
    party       name of party (in case of different spelling than filename)
    clf         manifestoproject classifier - see classifier.py
    max_txts    maximal number of texts - subsamples max_txts if there are more
    OUTPUT:
    predictions pandas DataFrame with predictions, texts and party as columns
    '''
    content = list(read_md(os.path.join(folder,fn)))
    if len(content) > max_txts:
        content = random.sample(content, max_txts)
    preds = clf.predictBatch(content)
    manifesto_codes = list(set(manifestolabels().values()).intersection(set(preds.columns.tolist())))
    preds['max_manifesto'] = preds[manifesto_codes].idxmax(axis=1)
    preds['max_domain'] = preds[list(label2domain.keys())].idxmax(axis=1)
    preds['max_leftright'] = preds[['left', 'right']].idxmax(axis=1)
    preds['content'] = content
    preds['party'] = party
    return preds

def compute_most_distant_statements_per_topic(preds, n_most_distant=5, folder=MANIFESTO_FOLDER):
    '''
    Computes for each topic and party the text segments that are most distant
    to the average text segments of all other parties. Could be interpreted as
    'characteristic statements' of a party
    INPUT:
    preds           predictions obtained by classify_br
    n_most_distant  number of 'characteristic' text segments to choose
    folder          folder to store results
    '''
    # BoW extraction
    tf = TfidfVectorizer().fit(preds.content)
    preds['tf_idf'] = preds.content.apply(lambda x: tf.transform([x]))
    most_distant_statements = []
    for domain in domains:
        for party in [x[0] for x in partyFiles]:
            # find statements of this party
            this_party = (preds.party == party) & (preds.max_domain == domain)
            # find statements of other parties
            other_parties = (preds.party != party) & (preds.max_domain == domain)
            # stack BoW features for this party
            partyVecs = sp.sparse.vstack(preds[this_party]['tf_idf'])
            partyTexts = preds[this_party]['content']
            # stack BoW vectors and take their average
            otherVec = sp.sparse.vstack(preds[other_parties]['tf_idf']).mean(axis=0)
            # compute L_1 distance between party and other parties
            dists = sp.array(abs(partyVecs - otherVec).sum(axis=1)).flatten()
            # find and store 'characteristic' text segments
            most_distant = [(partyTexts[idx], dists[idx]) for idx in dists.argsort()[-n_most_distant:][-1::-1]]
            most_distant_statements.extend([(party, domain, m, d) for m, d in most_distant])
    # store results as DataFrame
    most_distant_statements_df = pd.DataFrame(most_distant_statements, columns=['party', 'domain', 'most_distant_to_other_parties', 'distance'])
    most_distant_statements_df = most_distant_statements_df.sort_values(by=['party','domain'])
    most_distant_statements_df.to_csv(os.path.join(FOLDER,'most_distant_statements_per_topic.csv'),index=False)
    del(preds['tf_idf'])
    return most_distant_statements_df

def plotAll(folder = MANIFESTO_FOLDER):
    '''
    Run analysis for BR
    - Classifies texts per party
    - Create violin plots for each topic
    - Computes most 'characteristic' text segments for each party
    '''
    predictions = []
    colors = []
    clf = Classifier(train=True)
    for party, fn, color in partyFiles:
        predictions.append(classify_br(folder, fn, party, clf))
        colors.append(color)

    df = pd.concat(predictions)
    # compute most distant statements per topic, discard result as it's csv-dumped
    _ = compute_most_distant_statements_per_topic(df, folder=folder)

    plot_left_right(df, colors, folder=folder, plot_suffix = 'all_domains')

    for domain in domains:
        # get rows containing statements for this topic across all parties
        idx = df[domains].apply(pd.Series.argmax,axis=1)==domain
        plot_left_right(df[idx], colors, folder=folder, plot_suffix = domain)

    df.to_csv(os.path.join(FOLDER, "results.csv"))

def plot_left_right(df,
    colors,
    plot_column='right',
    grouping_column='party',
    folder=RESULT_FOLDER,
    plot_suffix=""):

    # median-centered per domain right position
    df[plot_column] = df[plot_column] - df[plot_column].median()
    ax = sns.violinplot(x=plot_column,y=grouping_column,
        data=df[[plot_column,grouping_column]], palette=sns.color_palette(colors),
        split=True,scale="count", inner="stick", saturation=0.5)
    ax.set_xlim([0,1])
    ax.set_xticks(np.arange(0,1,.1))
    ax.set_xlabel("links-rechts Index")
    ax.set_ylabel("Partei")
    ax.set_title(plot_suffix)
    output_file(os.path.join(folder,"violinPlot-%s.html"%plot_suffix))
    show(mpl.to_bokeh())

def compute_word_code_correlations(preds, folder=FOLDER):
    '''
    Computes correlations between single words and manifesto codes
    see also http://www.sciencedirect.com/science/article/pii/S1053811913010914
    '''
    tf = TfidfVectorizer(max_df=.2).fit(preds.content)
    preds['tf_idf'] = preds.content.apply(lambda x: tf.transform([x]))
    labels = list(set(manifestolabels().values()).intersection(set(preds.columns.tolist()))) + domains + ['right']
    idx2word = {v:k for k,v in tf.vocabulary_.items()}
    X = sp.sparse.vstack(preds.tf_idf)
    Xw = preds[labels].as_matrix()
    XXw = X.T.dot(Xw)
    correlations = {}
    for idx,mc in enumerate(labels):
        correlations[mc] = [idx2word[widx] for widx in XXw[:,idx].argsort()[::-1]]
        print("Most correlated words for {}:\n{}\n\n".format(mc,", ".join(correlations[mc][:50])))
    # write results to json file
    json.dump(correlations,open(os.path.join(FOLDER,"word_correlations.json"),"w"))

def sort_by_word_importance(text, label='right'):
    # read word correlations
    correlations = json.load(open(os.path.join(FOLDER,"word_correlations.json"),"r"))
    words = [re.sub('[!?,.-]','',w) for w in text.lower().split(" ")]
    text_sorted_by_relevance = [w for w in correlations[label] if w in words]

    print("Original Text:\n{}\n\n".format(text))
    print("Words sorted by relevance for classifier:\n{}\n\n".format(" ".join(text_sorted_by_relevance)))

if __name__ == "__main__":
    plotAll()
