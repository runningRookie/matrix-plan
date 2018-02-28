/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.io;

import java.util.Iterator;
import java.util.NoSuchElementException;

/**
 * @author zyy43688
 * @version $Id: MyIterable.java, v 0.1 2018年2月28日 下午3:37:56 zyy43688 Exp $
 */
public class MyIterable<T> implements Iterable<T> {

    private T[] names;
    private int index;

    public MyIterable(int size) {
        names = (T[]) new Object[size];
    }

    public boolean add(T t) {
        if (index < names.length) {
            names[index++] = t;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns an iterator over elements of type {@code T}.
     *
     * @return an Iterator.
     */
    @Override
    public Iterator<T> iterator() {
        return new MyIterableIterator();
    }

    private class MyIterableIterator implements Iterator<T> {

        private int start = 0;

        /**
         * Returns {@code true} if the iteration has more elements.
         * (In other words, returns {@code true} if {@link #next} would
         * return an element rather than throwing an exception.)
         *
         * @return {@code true} if the iteration has more elements
         */
        @Override
        public boolean hasNext() {
            return start < index;
        }

        /**
         * Returns the next element in the iteration.
         *
         * @return the next element in the iteration
         * @throws NoSuchElementException if the iteration has no more elements
         */
        @Override
        public T next() {
            return names[start++];
        }
    }
}