/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.collection;

import java.util.Stack;

/**
 * 栈实例
 *
 * @author zyy43688
 * @version $Id: StackDemo.java, v 0.1 2018年2月28日 下午3:02:14 zyy43688 Exp $
 */
public class StackDemo {
    public static void main(String[] args) throws InterruptedException {
        Stack<String> stack = new Stack<>();
        // 创建一个栈
        stack.push("张");
        stack.push("玉");
        stack.push("尧");

        while (!stack.isEmpty()) {
            System.out.println(stack.pop());
        }

        //        new Thread(() ->{
        //            while(!stack.empty()){
        //                System.out.print("子线程输出的结果：");
        //                System.out.println(stack.pop());
        //            }
        //        }).start();
        //
        //        while (!stack.empty()) {
        //            Thread.sleep(200);
        //            System.out.print("主线程输出的结果：");
        //            System.out.println(stack.pop());
        //        }
    }
}