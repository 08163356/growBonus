#!/bin/bash
set -e

APP_DIR="/var/www/growbonus"
DEPLOY_USER="www-data"

echo "========================================="
echo "  GrowBonus 部署脚本"
echo "========================================="

# 创建目录
echo "[1/7] 创建部署目录..."
sudo mkdir -p $APP_DIR/frontend/dist
sudo mkdir -p $APP_DIR/backend/uploads
sudo mkdir -p $APP_DIR/backend/data

# 解压部署包
echo "[2/7] 解压部署包..."
if [ -f "growbonus-deploy.zip" ]; then
    sudo unzip -o growbonus-deploy.zip -d $APP_DIR
else
    echo "请将 growbonus-deploy.zip 放在当前目录"
    exit 1
fi

# 安装后端依赖
echo "[3/7] 安装后端依赖..."
cd $APP_DIR/backend
sudo npm install --production

# 配置环境变量
echo "[4/7] 配置环境变量..."
if [ ! -f $APP_DIR/backend/.env ]; then
    cat > /tmp/growbonus-env << EOF
PORT=8003
JWT_SECRET=$(openssl rand -hex 32)
DB_PATH=./data/growbonus.db
UPLOAD_DIR=./uploads
NODE_ENV=production
EOF
    sudo mv /tmp/growbonus-env $APP_DIR/backend/.env
    echo "已创建 .env 文件，请检查配置"
else
    echo ".env 文件已存在，跳过"
fi

# 初始化数据库（首次部署）
echo "[5/7] 检查数据库..."
if [ ! -f $APP_DIR/backend/data/growbonus.db ]; then
    echo "首次部署，初始化数据库..."
    cd $APP_DIR/backend
    node dist/scripts/seed.js
    echo "数据库初始化完成"
else
    echo "数据库已存在，跳过初始化"
fi

# 设置权限
echo "[6/7] 设置文件权限..."
sudo chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod 700 $APP_DIR/backend/.env

# 配置 systemd 服务
echo "[7/7] 配置系统服务..."
sudo cp $APP_DIR/deploy/growbonus-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable growbonus-backend
sudo systemctl restart growbonus-backend

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "服务状态："
sudo systemctl status growbonus-backend --no-pager
echo ""
echo "请将 deploy/nginx-growbonus.conf 的内容"
echo "添加到 Nginx 配置的 server 块中，然后执行："
echo "  sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "默认账号："
echo "  管理员: uncle / 123456"
echo "  家长:   papa / 123456  |  mama / 123456"
echo "  孩子:   PIN 1234"
