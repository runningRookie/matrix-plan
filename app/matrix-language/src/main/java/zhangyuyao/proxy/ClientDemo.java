/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.proxy;

/**
 * 客户端
 *
 * @author zyy43688
 * @version $Id: ClientDemo.java, v 0.1 2018年2月26日 上午10:37:06 zyy43688 Exp $
 */
public class ClientDemo {
    public static void main(String[] args) {
        // 代理对象
        ProxyDemo proxyDemo = new ProxyDemo(new RealSubjectDemo());

        // 代理方法
        proxyDemo.request();
    }
}