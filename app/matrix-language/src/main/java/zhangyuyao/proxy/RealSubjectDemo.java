/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.proxy;

/**
 * 委托对象
 *
 * @author zyy43688
 * @version $Id: RealSubjectDemo.java, v 0.1 2018年2月26日 上午10:35:20 zyy43688 Exp $
 */
public class RealSubjectDemo implements SubjectDemo {
    @Override
    public void request() {
        System.out.println("我是委托对象！");
    }
}