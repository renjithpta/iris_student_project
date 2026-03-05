CREATE TABLE election_results (
 candidate_id VARCHAR(50) PRIMARY KEY,
 vote_count INTEGER DEFAULT 0
);

INSERT INTO election_results VALUES ('CAND_A',0);
INSERT INTO election_results VALUES ('CAND_B',0);
INSERT INTO election_results VALUES ('CAND_C',0);