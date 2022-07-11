create database db_name;
use db_name;

show tables;

create or replace table cities (
    spiral_id int,
    latitude float,
    longitude float,
    extra longtext,
    primary key(spiral_id)
);

create or replace table locations (
    place_id varchar(255),
    name varchar(255),
    address varchar(512),
    latitude float,
    longitude float,
    phone_number varchar(255),
    emails varchar(10000),
    website varchar(255),
    primary key(place_id)
);


INSERT INTO `cities` (`spiral_id`, `longitude`, `latitude`, `extra`) VALUES ('111', '100', '100', '{\"stores\":[\"a\",\"b\"]}');
CREATE USER  'seborah'@'seborah.lan' IDENTIFIED BY 'QMpy97iwXcexh';
GRANT ALL ON testing_locations.* to 'seborah'@'seborah.lan' IDENTIFIED BY 'QMpy97iwXcexh' WITH GRANT OPTION;
ALTER TABLE locations ADD extra longtext;
UPDATE locations SET emails = ? WHERE place_id = ?;
