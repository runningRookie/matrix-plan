/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.proxy;

/**
 * 代理对象
 *
 * @author zyy43688
 * @version $Id: ProxyDemo.java, v 0.1 2018年2月26日 上午10:36:06 zyy43688 Exp $
 */
public class ProxyDemo implements SubjectDemo {

    private SubjectDemo subjectDemo;

    /**
     * 委托对象通过构造方法传入
     * 
     * @param subjectDemo
     */
    public ProxyDemo(SubjectDemo subjectDemo) {
        this.subjectDemo = subjectDemo;
    }

    @Override
    public void request() {
        System.out.println("我是代理对象！");
        subjectDemo.request();
    }
}