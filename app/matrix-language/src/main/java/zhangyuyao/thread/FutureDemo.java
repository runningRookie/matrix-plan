/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.thread;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

/**
 * Future实例
 *
 * @author zyy43688
 * @version $Id: FutureDemo.java, v 0.1 2018年2月26日 下午4:53:09 zyy43688 Exp $
 */
interface ArchiveSearcher {
    String search(String target);
}

/**
 * future
 */
public class FutureDemo {

    /**
     * 线程池
     */
    private ExecutorService executorService = Executors.newFixedThreadPool(3);

    /**
     * function interface
     */
    private ArchiveSearcher archiveSearcher = (target -> "target");

    void showSearch(final String target) throws InterruptedException, ExecutionException {

        Future<String> future = executorService.submit(() -> {
            try {
                System.out.println("进入call");
                Thread.sleep(2000);
                System.out.println("执行call结束");
                return archiveSearcher.search(target);
            } catch (InterruptedException e) {
                e.printStackTrace();
                return "";
            }
        });

        displayOtherThings();
        try {
            System.out.println(future.get());
        } catch (ExecutionException e) {
            throw e;
        }

        System.out.println("结束");
    }

    private void displayOtherThings() throws InterruptedException {
        for (int i = 0; i < 20; i++) {
            System.out.println(i);
            Thread.sleep(100);
        }
    }

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        new FutureDemo().showSearch("target");
    }
}