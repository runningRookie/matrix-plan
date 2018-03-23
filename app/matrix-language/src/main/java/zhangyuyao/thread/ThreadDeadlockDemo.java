/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.thread;

/**
 * 线程死锁实例
 *
 * @author zyy43688
 * @version $Id: ThreadDeadlockDemo.java, v 0.1 2018年3月23日 上午9:30:40 zyy43688 Exp $
 */
public class ThreadDeadlockDemo {

    private Foo foo;

    public ThreadDeadlockDemo() {
    }

    public void setFoo(Foo foo) {
        this.foo = foo;
    }

    /**
     * 
     * @param args
     */
    public static void main(String[] args) {
        System.out.println("主线程");

        // 创建对象
        ThreadDeadlockDemo threadDeadlockDemo = new ThreadDeadlockDemo();
        Foo foo = new Foo();

        // 设置对象
        threadDeadlockDemo.setFoo(foo);
        foo.setThreadDeadlockDemo(threadDeadlockDemo);

        // 线程1
        new Thread(() -> threadDeadlockDemo.method1()).start();

        // 线程2
        new Thread(() -> foo.method2()).start();
    }

    public synchronized void method1() {
        try {
            System.out.println("method1");
            Thread.sleep(1000);// 停滞1秒，让线程2执行
            foo.method2();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

class Foo {

    private ThreadDeadlockDemo threadDeadlockDemo;

    public Foo() {
    }

    public void setThreadDeadlockDemo(ThreadDeadlockDemo threadDeadlockDemo) {
        this.threadDeadlockDemo = threadDeadlockDemo;
    }

    public Foo(ThreadDeadlockDemo threadDeadlockDemo) {
        this.threadDeadlockDemo = threadDeadlockDemo;
    }

    public synchronized void method2() {
        System.out.println("method2");
        threadDeadlockDemo.method1();
    }
}