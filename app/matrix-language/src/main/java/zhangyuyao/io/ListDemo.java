/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.io;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

/**
 * @author zyy43688
 * @version $Id: ListDemo.java, v 0.1 2018年2月28日 下午3:28:55 zyy43688 Exp $
 */
public class ListDemo {
    public static void main(String[] args) {
        new ListDemo().test1();
    }

    public void test1() {
        List<String> list = new ArrayList<>();
        list.add("a");
        list.add("a");
        list.add("b");
        list.add("c");
        list.add("d");

        String[] chars = new String[0];
        System.out.println(chars == list.toArray(chars));

        System.out.println(Arrays.toString(chars));

        for (int i = 0; i < list.size(); i++) {
            if ("a".equals(list.get(i))) {
                list.remove(i);
                i--;
            }
        }

        System.out.println(list.toString());

        System.out.println(list.size());
        list.add(list.size(), "foo");
        System.out.println(list.toString());

        list.replaceAll(String::toUpperCase);
        System.out.println(list.toString());

    }

    public void test2() {
        List<String> list = new ArrayList<>();
        list.add("a");
        list.add("a");
        list.add("b");
        list.add("c");
        list.add("d");

        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            if ("a".equals(iterator.next())) {
                iterator.remove();
            }
        }

        System.out.println(list.toString());
    }

    public void test3() {
        List<String> list = new ArrayList<>();
        list.add("a");
        list.add("a");
        list.add("b");
        list.add("c");
        list.add("d");

        for (String string : list) {
            if ("b".equals(string)) {
                list.remove("b");
            }
        }

        System.out.println(list.toString());
    }

    public void test() {
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