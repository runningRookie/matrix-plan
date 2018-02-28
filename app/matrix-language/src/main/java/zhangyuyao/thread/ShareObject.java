/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.thread;

/**
 * 共享对象，这边是没有问题的那这边呢？
 *
 *
 * @author zyy43688
 * @version $Id: ShareObject.java, v 0.1 2018年2月27日 下午3:36:58 zyy43688 Exp $
 */
public class ShareObject {
    private static int     number;

    private static boolean read;

    private static class MyThread implements Runnable {
        @Override
        public void run() {
            while (!read) {
                Thread.yield();
            }
            System.out.println(number);
        }
    }

    public static void main(String[] args) {
        Thread thread = new Thread(new MyThread());
        thread.start();
        number = 42;
        read = true;
    }
}