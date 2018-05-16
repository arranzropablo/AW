create table user (email varchar(100), password varchar(100), img varchar(100), primary key(email));
create table task (id int(11) AUTO_INCREMENT, user varchar(100), text text, done tinyint(1), primary key(id), foreign key (user) references user(email));
create table tag (taskId int(11), tag varchar(100), primary key(taskId, tag), foreign key (taskId) references task(id));