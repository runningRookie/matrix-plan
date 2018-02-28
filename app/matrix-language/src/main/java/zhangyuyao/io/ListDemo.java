/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.io;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * @author zyy43688
 * @version $Id: ListDemo.java, v 0.1 2018年2月28日 下午3:28:55 zyy43688 Exp $
 */
public class ListDemo {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>();

        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);

        for (int string : list) {
            System.out.println(string);
        }

        Iterator<Integer> iterator = list.iterator();

        while (iterator.hasNext()) {
            if (iterator.next() % 2 == 0) {
                System.out.println("进入");
                iterator.remove();
            }
        }

        System.out.println(list);

        Iterator<Integer> integerIterator = list.iterator();
        integerIterator.forEachRemaining(System.out::println);
    }
}