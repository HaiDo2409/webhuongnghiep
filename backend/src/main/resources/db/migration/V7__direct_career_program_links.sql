CREATE TABLE career_program_links (
    career_id VARCHAR(100) NOT NULL REFERENCES careers(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    PRIMARY KEY (career_id, program_id)
);
CREATE INDEX career_program_program_idx ON career_program_links(program_id);
