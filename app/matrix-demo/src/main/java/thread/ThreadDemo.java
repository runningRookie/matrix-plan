/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package thread;

/**
 * 线程实例
 *
 * @author zyy43688
 * @version $Id: ThreadDemo.java, v 0.1 2018年2月23日 下午2:16:11 zyy43688 Exp $
 */
public class ThreadDemo {

    // 线程的一些常用的场景怎么用呢？

    public static void main(String[] args) {
        System.out.println("before");
        // 启动一个线程
        new Thread(() -> System.out.println("middle")).start();
        System.out.println("after");
    }
}