/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.generic;

class Message<T> {

    /**
     * 信息
     */
    private T msg;

    public T getMsg() {
        return msg;
    }

    public void setMsg(T msg) {
        this.msg = msg;
    }
}

/**
 * 泛型实例
 *
 * @author zyy43688
 * @version $Id: GenericDemo.java, v 0.1 2018年2月23日 下午3:46:33 zyy43688 Exp $
 */
public class GenericDemo {
    public static void main(String[] args) {

        // 由使用者进行制定
        Message<String> message = new Message<>();

        // 设置消息
        message.setMsg("message for you!");

        // 输出内容
        System.out.println(message.getMsg());
        print(message);// 泛型方法

        Message<Parent> msg = new Message<>();

        print2(msg);
        print3(message);

    }

    /**
     * 泛型方法
     * <p>
     * 泛型类型在方法修饰符后面，返回值前面进行定义
     *
     * @param message
     * @param <T>
     */
    public static <T> void print(Message<T> message) {
        System.out.println(message.getMsg());
    }

    /**
     * 使用类型通配符消除泛型带来的类型制定问题
     *
     * @param message
     */
    public static void print2(Message<? super Children> message) {
        System.out.println(message.getMsg());
    }

    public static void print3(Message<? extends CharSequence> message) {
        System.out.println(message.getMsg());
    }
}


/**
 * 泛型
 * 类定义的时候不指定类型
 * 类型由使用者制定
 */


// 泛型方法和类型通配符
// 上限和下限
// extends && supper
// 方法上只能设置extends
// 类上可以设置extends和supper
// 通配符可以配合extends和super一起使用
// extends设置的是类的上线，说明必须是指定类的子类型才能传入
// super设置的类的下限，说明必须是指定类的父类型才能传入
// 泛型方法和泛型类都只能与extends配合使用
// 使用规则和通配符下的是一致的

