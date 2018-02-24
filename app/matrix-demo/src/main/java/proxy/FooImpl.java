/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package proxy;

/**
 * @author zyy43688
 * @version $Id: FooImpl.java, v 0.1 2018年1月31日 下午3:38:27 zyy43688 Exp $
 */
public class FooImpl implements Foo {
    @Override
    public String introduction() {
        System.out.println("我是无参方法！");
        return "我是无参方法！";
    }

    @Override
    public void introduction(String msg) {
        System.out.println("哈哈，我是有参数的方法：" + msg);
    }
}