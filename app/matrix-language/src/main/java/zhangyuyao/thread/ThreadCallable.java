/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.thread;

import java.util.concurrent.Callable;

/**
 * CallBack
 *
 * @author zyy43688
 * @version $Id: ThreadCallable.java, v 0.1 2018年2月24日 下午3:21:58 zyy43688 Exp $
 */
public class ThreadCallable implements Callable {
    @Override
    public Object call() throws Exception {
        System.out.println("ThreadCallable");
        return new Object();
    }
}