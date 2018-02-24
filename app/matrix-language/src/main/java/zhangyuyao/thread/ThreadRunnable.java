/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.thread;

/**
 * Runnable接口实现
 *
 * @author zyy43688
 * @version $Id: ThreadRunnable.java, v 0.1 2018年2月24日 下午3:18:35 zyy43688 Exp $
 */
public class ThreadRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("ThreadRunnable");
    }
}