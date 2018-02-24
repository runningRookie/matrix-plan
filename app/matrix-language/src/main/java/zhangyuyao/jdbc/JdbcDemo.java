/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.jdbc;

/**
 * JDBC实例
 *
 * 创建简单的表和数据库
 *
 * @author zyy43688
 * @version $Id: JdbcDemo.java, v 0.1 2018年2月24日 上午9:50:45 zyy43688 Exp $
 */
public class JdbcDemo {
    public static void main(String[] args) {
        // 只创建了一个对象
        GrabDemo grabDemo = new GrabDemo();
        System.out.println("start");
        // 循环一百次创建一百个线程
        for (int i = 0; i < 100; i++) {
            new Thread(() -> {
                grabDemo.grab();
            }).start();
        }
        System.out.println("end");
    }
}