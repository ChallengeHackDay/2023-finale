FROM ubuntu:20.04
RUN apt update -y
RUN DEBIAN_FRONTEND=noninteractive apt install apache2 php-mysql php mysql-server -yq
ADD init.sh /
RUN chmod +x /init.sh
ADD memory.sql /tmp
RUN service mysql start ; mysql -u root --password="" -e "CREATE USER 'admin'@'localhost' IDENTIFIED BY 'HJRKurioealPOIEEE';" ; mysql -u root --password="" -e "GRANT ALL PRIVILEGES ON memory.* TO 'admin'@'localhost';" ; mysql -u root --password="" -e "FLUSH PRIVILEGES" ;mysql -u root --password="" -e "CREATE DATABASE memory";mysql -u root --password="" memory < /tmp/memory.sql
RUN rm /var/www/html/index.html
ADD ./app /var/www/html
CMD /init.sh
EXPOSE 80

