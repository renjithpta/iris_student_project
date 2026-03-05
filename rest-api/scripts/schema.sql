USE irisdatabase;
CREATE TABLE Users (
id bigint(20) NOT NULL AUTO_INCREMENT,
name varchar(40) NOT NULL,
username varchar(500) NOT NULL,
fabricClientId varchar(900) ,
fabricOrg varchar(40) NOT NULL,
apiKey varchar(900) ,
apiKeySecret varchar(900) ,
userType varchar(40) NOT NULL,
password varchar(100) NOT NULL,
createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
updatedAt timestamp DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id),
UNIQUE KEY uk_users_usernamess (username)
);
