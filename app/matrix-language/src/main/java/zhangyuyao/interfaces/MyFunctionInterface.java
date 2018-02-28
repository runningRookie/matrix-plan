/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.interfaces;

/**
 * 函数接口
 *
 * @author zyy43688
 * @version $Id: MyFunctionInterface.java, v 0.1 2018年2月26日 下午2:23:48 zyy43688 Exp $
 */
@FunctionalInterface
public interface MyFunctionInterface<T> {
    /**
     * 静态属性
     */
    int count = 0;

    /**
     * 方法签名
     * 
     * @param t
     */
    void print(T t);

    /**
     * 默认方法
     */
    default void print1() {
        System.out.println("我是默认方法！");
    }

    /**
     * 静态方法
     */
    static void print2() {
        System.out.println("我是静态方法！");
    }
}