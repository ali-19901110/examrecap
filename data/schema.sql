
DROP TABLE dimons;
CREATE TABLE IF NOT EXISTS dimons (
    id serial primary key  not null ,
    name varchar(255) ,
    img varchar(255) ,
    level varchar(255) 
);