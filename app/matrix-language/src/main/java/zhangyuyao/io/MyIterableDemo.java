/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.io;

import java.util.Iterator;

/**
 * @author zyy43688
 * @version $Id: MyIterableDemo.java, v 0.1 2018年2月28日 下午3:53:36 zyy43688 Exp $
 */
public class MyIterableDemo {
    public static void main(String[] args) {
        MyIterable<String> myIterable = new MyIterable<>(10);

        myIterable.add("张");
        myIterable.add("玉");
        myIterable.add("尧");
        myIterable.add("米");

        for (String string : myIterable) {
            System.out.println(string);
        }


        Iterator<String> iterator = myIterable.iterator();
        while(iterator.hasNext()){
            System.out.println(iterator.next());
        }
    }
}