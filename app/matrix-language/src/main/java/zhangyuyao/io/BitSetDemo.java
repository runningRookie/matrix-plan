/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.io;

import java.util.BitSet;

/**
 * @author zyy43688
 * @version $Id: BitSetDemo.java, v 0.1 2018年3月1日 下午2:56:41 zyy43688 Exp $
 */
public class BitSetDemo {
    public static void main(String[] args) {
        BitSet bitSet = new BitSet();
        bitSet.set(3333);
        System.out.println(bitSet.nextClearBit(0));
    }
}