<p align="center">
<img src="https://wpoffice365.com/wp-content/uploads/2017/07/react-logo.png" height="75" />
<img src="https://www.vectorlogo.zone/logos/js_webpack/js_webpack-card.png" height="75" />
<img src="https://cdn-images-1.medium.com/max/960/1*pxfq-ikL8zPE3RyGB2xbng.png" height="75" />
</p>

DeepLeela
===

A modern Go Website with Leela

## Prerequisites

1. Node.js 8.9+

2. NPM 5.6+

# Building

```
git clone https://github.com/deepleela/deepleela.git
cd deepleela
npm install
npm run build
```

The static files are located in the `./build` folder.

# Hosting a website

Example: Using nginx on CentOS

```
yum -y update
yum install epel-release
yum install nginx 

systemctl start nginx
systemctl enable nginx

nano /etc/nginx/conf.d/deepleela.conf

server {
    server_name _;
    root /path/to/deepleela;
    
    location / {
        try_files $uri $uri/ /index.html =404;
    }
}
```

We recommend installing certbot on your servers to enable TLS. More info: http://certbot.eff.org/

# License
GPL v3