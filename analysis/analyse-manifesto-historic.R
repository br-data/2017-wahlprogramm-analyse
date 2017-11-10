library(tidyverse)
library(manifestoR)

mp_setapikey("manifesto-apikey.txt")

parties <- tribble(
  ~id, ~name,
  41953, 'AfD',
  41521, 'CDU/CSU',
  41221, 'Die Linke',
  41222, 'Die Linke',
  41223, 'Die Linke',
  41420, 'FDP',
  41113, 'Grüne',
  41320, 'SPD'
)

calc_rile_per_document <- function(doc) {
  # just to double check

  r <- doc %>%
    as_data_frame(with.meta = TRUE) %>%
    group_by(cmp_code) %>%
    summarise(count = n()) %>%
    filter(cmp_code %in% rile_r()) %>%
    summarise(sum = sum(count)) %>%
    select(sum)

  l <- doc %>%
    as_data_frame(with.meta = TRUE) %>%
    group_by(cmp_code) %>%
    summarise(count = n()) %>%
    filter(cmp_code %in% rile_l()) %>%
    summarise(sum = sum(count)) %>%
    select(sum)

  a <- doc %>%
    as_data_frame(with.meta = TRUE) %>%
    group_by(cmp_code) %>%
    summarise(count = n()) %>%
    filter(!is.na(cmp_code)) %>%
    summarise(sum = sum(count)) %>%
    select(sum)

  # (r - l) / (r + l) * 100
  (r - l) / a * 100

}
  

rile_focused <- function(data) {
  # custom scale function that normalises rile score only with relevant codes (r + l), not all (r + l + o)
  # see Budge: THE STANDARD RIGHT-LEFT SCALE [2016]
  
  num <- scale_bipolar(data, pos = paste0("per", rile_r()), neg = paste0("per", rile_l()))
  # (r - l) / (r + l + o)

  denom <- (scale_bipolar(data, pos = paste0("per", rile_r()), neg = c()) + scale_bipolar(data, pos = paste0("per", rile_l()), neg = c()))
  # (r + l) / (r + l + o)

  (num / denom)
  # (r - l) / (r + l)
  
  # num <- scale_bipolar(data, pos = paste0("per", rile_r()), neg = paste0("per", rile_l()))
  # denom <- 1
  # num/denom
}

calc_scores <- function (party_id) {
  # calculates scores for all wahlprogramme of a certain party after the year 2000-01-01
  
  party_corpus <- mp_corpus(countryname == "Germany" & party == party_id & edate > as.Date("2000-01-01"))
  mp_scale(party_corpus, scalingfun = rile_focused)
}

scores_l <- lapply(parties$id, calc_scores)
scores <- Reduce(function(x, y) {rbind(x, y)}, scores_l, data_frame())
scores <- scores %>% inner_join(parties, by = c("party" = "id"))

write_csv(scores %>% select(-party), "./results/rile-scores-historic.csv")