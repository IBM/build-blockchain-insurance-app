*阅读本文的其他语言版本：[English](README.md),[Japanese](README-ja.md).*


# 构建区块链保险应用程序

本项目展示在保险领域使用区块链来进行索赔处理。在本应用程序中，我们有 4 个参与者，分别是 Insurance、Police、Repair Shop 和 Shop 对等节点。Insurance 对等节点是为产品提供保险并负责处理索赔的保险公司。Police 对等节点负责核查被盗索赔。Repair Shop 对等节点负责修理产品，而 Shop 对等节点负责向用户销售产品。

目标受众级别：中级开发人员

## 包含的组件
* Hyperledger Fabric
* Docker

## 应用程序工作流图
![工作流](images/arch-blockchain-insurance2.png)

* 为对等节点生成证书
* 为网络构建 Docker 镜像
* 启动保险网络

## 前提条件

* [Docker](https://www.docker.com/products/overview) - v1.13 或更高版本
* [Docker Compose](https://docs.docker.com/compose/overview/) - v1.8 或更高版本
* [Node.js 和 npm](https://nodejs.org/en/download/) - node v6.2.0 - v6.10.0（不支持 v7+）；您的 node 安装中包含 npm。
* [Git 客户端](https://git-scm.com/downloads) - 执行克隆命令时需要它

## 步骤

1. [运行应用程序](#1-run-the-application)

## 1. 运行应用程序

克隆该存储库：
```bash
git clone https://github.com/IBM/build-blockchain-insurance-app.git
```

使用您的 [docker hub](https://hub.docker.com/) 凭证进行登录。
```bash
Docker login
```

运行构建脚本来下载并创建订购者、Insurance 对等节点、Police 对等节点、Shop 对等节点、Repair Shop 对等节点、Web 应用程序和每个对等节点的证书颁发机构的 Docker 镜像。

对于 Mac 用户：
```bash
cd build-blockchain-insurance-app
./build_mac.sh
```

对于 Ubuntu 用户：
```bash
cd build-blockchain-insurance-app
./build_ubuntu.sh
```

您会在控制台上看到以下输出：
```
Creating repairshop-ca ...
Creating insurance-ca ...
Creating shop-ca ...
Creating police-ca ...
Creating orderer0 ...
Creating repairshop-ca
Creating insurance-ca
Creating police-ca
Creating shop-ca
Creating orderer0 ... done
Creating insurance-peer ...
Creating insurance-peer ... done
Creating shop-peer ...
Creating shop-peer ... done
Creating repairshop-peer ...
Creating repairshop-peer ... done
Creating web ...
Creating police-peer ...
Creating web
Creating police-peer ... done
```

**等待几分钟，让应用程序在网络上安装并实例化该链代码**

使用以下命令检查安装状态：
```bash
docker logs web
```
完成上述操作时，您会在控制台上看到以下输出：
```
npm info it worked if it ends with ok
npm info using npm@3.10.10
npm info using node@v6.11.3
npm info lifecycle blockchain-for-insurance@2.1.0~preserve: blockchain-for-insurance@2.1.0
npm info lifecycle blockchain-for-insurance@2.1.0~serve: blockchain-for-insurance@2.1.0

> blockchain-for-insurance@2.1.0 serve /app
> cross-env NODE_ENV=production node ./bin/server

/app/app/static/js
Server running on port: 3000
info: [EventHub.js]: _connect - options {"grpc.ssl_target_name_override":"insurance-peer","grpc.default_authority":"insurance-peer"}
info: [EventHub.js]: _connect - options {"grpc.ssl_target_name_override":"shop-peer","grpc.default_authority":"shop-peer"}
info: [EventHub.js]: _connect - options {"grpc.ssl_target_name_override":"repairshop-peer","grpc.default_authority":"repairshop-peer"}
info: [EventHub.js]: _connect - options {"grpc.ssl_target_name_override":"police-peer","grpc.default_authority":"police-peer"}
Default channel not found, attempting creation...
Successfully created a new default channel.
Joining peers to the default channel.
Chaincode is not installed, attempting installation...
Base container image present.
info: [packager/Golang.js]: packaging GOLANG from bcins
info: [packager/Golang.js]: packaging GOLANG from bcins
info: [packager/Golang.js]: packaging GOLANG from bcins
info: [packager/Golang.js]: packaging GOLANG from bcins
Successfully installed chaincode on the default channel.
Successfully instantiated chaincode on all peers.
```

使用链接 http://localhost:3000 将该 Web 应用程序加载到浏览器中。

主页显示了网络中的参与者（对等节点）。您可以看到这里实现了 Insurance、Repair Shop、Police 和 Shop 对等节点。它们是网络的参与者。

![区块链保险](images/home.png)

假设您是一位希望购买手机、自行车或滑雪板的用户（下文称为“骑行者”）。通过单击“Go to the shop”部分，您被重定向到提供了以下产品的商店（shop 对等节点）。

![客户购物](images/Picture1.png)

可以看到该商店现在提供了 3 款产品。此外，您拥有可用于这些产品的保险合约。在我们的场景中，您是一位想买一辆新自行车的户外运动爱好者。因此，您将单击 Bike Shop 部分。

![购物](images/Picture2.png)

在这一部分，可以在商店中看到不同的自行车。可以在 4 种不同的自行车中进行选择。单击 Next，您将跳转到下一页，这一页将要求提供客户的个人数据。

![自行车商店](images/Picture3.png)

您可以在不同保险合约之间进行选择，这些合约有不同的保险范围以及条款和条件。您需要输入您的个人数据，并选择合约的开始日期和结束日期。因为短期或事件驱动的合约是保险行业的发展趋势，所以您有机会按天来选择合约有效期。保险合约的每天价格可以通过链代码中定义的一个公式来计算。单击 Next，您将跳转到一个屏幕，其中汇总了您的购买信息并显示了您的总金额。

![自行车保险](images/Picture4.png)

该应用程序将显示购买的总金额。单击“order”即表明您同意这些条款和条件并完成交易（签署合约）。此外，您将收到一个唯一的用户名和密码。登录凭证将在您提出索赔后使用。  一个区块被写入到区块链中。

>备注：可以单击右下角的黑色箭头来查看该区块。

![自行车保险](images/Picture5.png)

登录凭证。将区块写入到区块链中。

![登录凭证](images/Picture6.png)

发生事故后，骑行者可以选择“claim Self-Service”选项卡来自行提出索赔。

![索赔服务](images/Picture61.png)

骑行者将被要求使用之前提供给他的凭证进行登录。

![登录](images/Picture7.png)

他可以选择上面所示的选项卡来提出一个新索赔。

![提出索赔](images/Picture8.png)

骑行者可以简要描述他的自行车所受的损伤和/或选择它是否被盗。如果自行车被盗，索赔将交由警察处理，警察必须确认或否认盗窃（选项 1）。如果只有一处损伤，索赔将由修理厂处理（选项 2）。在下一节，我们将开始分析选项 1。

![索赔描述](images/Picture9.png)

**选项 1**

骑行者提交索赔后，它将显示在一个标红的方框中。此外，另一个区块会写到区块链中。
![索赔区块](images/Picture10.png)

骑行者也可以查看有效的索赔。

![有效索赔](images/Picture11.png)

通过选择“claim processing”，保险公司可以查看尚未处理的所有有效索赔。职员可在此视图中对这些索赔做出决定。因为我们仍在分析选项 1，所以盗窃需要由警察确认或否认。因此，保险公司在此阶段只能拒绝索赔。

![索赔处理](images/Picture12.png)

Police 对等节点可以查看包含盗窃的索赔。如果报告自行车被盗了，他们可以确认该索赔并包含一个文件引用编号。如果没有报告盗窃，他们可以拒绝该索赔，索赔不会被处理。

![Police 对等节点](images/Picture13.png)

我们假设骑行者没有勒索保险公司，而且已经报告了自行车被盗。警察将确认该索赔，这会导致另一个区块被写入区块链中。

![警察事务](images/Picture14.png)

返回到“claim processing”选项卡，可以看到保险公司现在可以选择赔偿，因为警察已确认自行车被盗。一个区块被写入到区块链中。

![索赔处理](images/Picture15.png)

骑行者可以看到他的索赔的新状态被更改为已赔偿。

![用户登录](images/Picture16.png)

**选项 2**

选项 2 涵盖事故的处理情况。

![事故](images/Picture17.png)

保险公司的“claim processing”选项卡显示了未处理的索赔。职员可以在处理索赔的三个选项之间进行选择。“Reject”将停止索赔流程，而“reimburse”会直接导致向客户支付。如果某个部分需要修理，保险公司可以选择“repair”。这会把索赔转发给修理厂，并将生成一个修理订单。一个区块被写入到区块链中。

![索赔处理](images/Picture18.png)

修理厂会获得一条显示修理订单的消息。在完成修理工作后，修理厂可以将订单标记为已完成。随后，保险公司将会获得一条消息，以便继续向修理厂支付费用。一个区块被写入到区块链中

![修理厂](images/Picture19.png)

骑行者可以在这个“claim self-service”选项卡中看到，索赔已被解决，自行车已被修理厂修好。

![索赔状态](images/Picture20.png)

保险公司可以选择激活或停用某些合约。这并不意味着客户已签署的合约不再有效。只是意味着不允许再签署这些类型的合约。此外，保险公司可以创建包含不同条款、条件和定价的新合约模板。  任何事务都会导致一个区块被写入区块链中。

![合约管理](images/Picture21.png)

## 附加资源
以下是一个附加区块链资源列表：
* [IBM 区块链基础](https://www.ibm.com/blockchain/what-is-blockchain.html)
* [Hyperledger Fabric 文档](https://hyperledger-fabric.readthedocs.io/)
* [GitHub 上的 Hyperledger Fabric 代码](https://github.com/hyperledger/fabric)

## 故障排除

* 运行 `clean.sh` 来删除保险网络的 Docker 镜像和容器。
```bash
./clean.sh
```
## 许可
[Apache 2.0](LICENSE)
