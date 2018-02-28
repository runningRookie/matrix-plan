/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.interfaces;

/**
 * 接口示例
 *
 * @author zyy43688
 * @version $Id: InterfaceDemo.java, v 0.1 2018年2月26日 下午2:06:07 zyy43688 Exp $
 */
public class InterfaceDemo {
    public static void main(String[] args) {
        System.out.println(IMessage.msg);
        IMessage.print1();

        System.out.println(MyMessage.msg);
        System.out.println(new MyMessage().msg);

        new MyMessage().print2();
        new MyMessage().print();

        // 函数接口
        // lambda表达式
        // 方法引用
        MyFunctionInterface<String> myFunctionInterface = System.out::println;

        myFunctionInterface.print("This is a test!");
        myFunctionInterface.print1();
    }
}