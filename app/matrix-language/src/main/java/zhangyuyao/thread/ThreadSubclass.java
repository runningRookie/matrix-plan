/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.thread;

/**
 * 继承实现
 *
 * @author zyy43688
 * @version $Id: ThreadSubclass.java, v 0.1 2018年2月24日 下午3:21:16 zyy43688 Exp $
 */
public class ThreadSubclass extends Thread {
    @Override
    public void run() {
        System.out.println("ThreadSubclass");
    }
}