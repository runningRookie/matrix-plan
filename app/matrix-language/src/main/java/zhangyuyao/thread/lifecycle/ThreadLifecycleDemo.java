/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.thread.lifecycle;

/**
 * 线程生命周期实例
 *
 * @author zyy43688
 * @version $Id: ThreadLifecycleDemo.java, v 0.1 2018年3月16日 上午11:35:03 zyy43688 Exp $
 */
public class ThreadLifecycleDemo extends Thread {
    private int i;

    @Override
    public void run() {
        for (; i < 100; i++) {
            System.out.println(getName() + " " + i);
        }
    }

    /**
     * ...........
     * ...........
     * ...........
     * ...........
     *
     * @param args
     */
    public static void main(String[] args) {
        // 创建线程对象
        ThreadLifecycleDemo sd = new ThreadLifecycleDemo();
        for (int i = 0; i < 300; i++) {
            // 调用Thread的currentThread方法获取当前线程
            System.out.println(Thread.currentThread().getName() + "" + i);
            if (i == 20) {
                // 启动线程
                sd.start();
                // 判断启动后线程的isAlive()值，输出true
                System.out.println(sd.isAlive());
            }
            // 只有当线程处于新建、死亡两种状态时isAlive()方法返回false。
            // 当i > 20，则该线程肯定已经启动过了，如果sd.isAlive()为假时，
            // 那只能是死亡状态了。
            if (i > 20 && !sd.isAlive()) {
                // 试图再次启动该线程
                sd.start();
            }
        }
    }
}