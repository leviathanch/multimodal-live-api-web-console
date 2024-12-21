FROM node:latest
RUN mkdir -p /work
WORKDIR /work
RUN npm install -g serve
RUN apt update && apt install -y xsel
EXPOSE 3000
USER root
#CMD npx serve -s build --ssl-key security/key.pem --ssl-cert security/cert.pem -d -C -S
CMD ["node","src/server.js"]
