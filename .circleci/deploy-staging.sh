# cp .env.staging .env
rm -rf .gitignore .eslintignore .eslintrc .circleci node_modules src test
rm .env.example README.md

ssh root@18.219.72.101 "cd /home/CNPM-staging && rimraf dist"

rsync -avzP . root@18.219.72.101:/home/CNPM-staging

ssh root@18.219.72.101 "cd /home/CNPM-staging && npm install && pm2 update && exit"


# ssh root@18.219.72.101 "cd /home/CNPM && git pull origin master && npm install && npm run build && pm2 update && exit"