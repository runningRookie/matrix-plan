/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.interfaces;

/**
 * 接口
 *
 * @author zyy43688
 * @version $Id: IMessage.java, v 0.1 2018年2月26日 下午1:53:00 zyy43688 Exp $
 */
public interface IMessage {
    /**
     * 接口属性
     * 默认被public static final修饰（可省略）
     * 能够被子类继承
     */
    String msg = "接口中定义的静态属性";

    /**
     * 方法签名
     * 默认使用public修饰（可省略）
     * 子类必须实现该方法
     */
    void print();

    /**
     * 静态方法
     * 默认使用public修饰（可省略）
     * 静态方法不会被继承，只属于接口
     */
    static void print1() {
        System.out.println("我是静态方法");
    }

    /**
     * 默认方法
     * 默认方法默认使用public修饰
     * 默认方法默认被子类继承
     */
    default void print2() {
        System.out.println("我是默认方法");
    }
}