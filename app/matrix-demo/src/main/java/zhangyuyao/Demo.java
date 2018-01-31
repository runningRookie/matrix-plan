/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao;

/**
 * 测试类
 *
 * @author zyy43688
 * @version $Id: Demo.java, v 0.1 2018年1月4日 下午3:39:20 zyy43688 Exp $
 */
public class Demo {
    private String name;

    void say() {
        System.out.println("I am Demo class! are your name " + name + "?");
    }

    public void setName(String name) {
        this.name = name;
    }
}