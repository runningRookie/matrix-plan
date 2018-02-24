/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.thread;

/**
 * 线程例子
 *
 * @author zyy43688
 * @version $Id: ThreadDemo.java, v 0.1 2018年2月24日 下午3:24:18 zyy43688 Exp $
 */
public class ThreadDemo {

    public static void main(String[] args) {
        System.out.println("start");

        Thread thread;

        // lambda表达式实现
        thread = new Thread(() -> System.out.println("lambda表达式实现"));
        thread.start();

        // 接口实现
        thread = new Thread(new ThreadRunnable());
        thread.start();

        // 继承实现
        thread = new ThreadSubclass();
        thread.start();

        System.out.println("end");
    }
}