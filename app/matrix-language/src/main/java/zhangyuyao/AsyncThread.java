package zhangyuyao;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.*;

/**
 * 多线程执行，异步获取结果
 * 
 * @author i-clarechen
 *
 */
public class AsyncThread {

    public static void main(String[] args) {
        AsyncThread t = new AsyncThread();
        List<Future<String>> futureList = new ArrayList<Future<String>>();
        t.generate(3, futureList);
        t.doOtherThings();
        t.getResult(futureList);
    }

    /**
     * 生成指定数量的线程，都放入future数组
     * 
     * @param threadNum
     * @param fList
     */
    public void generate(int threadNum, List<Future<String>> fList) {
        ExecutorService service = Executors.newFixedThreadPool(threadNum);
        for (int i = 0; i < threadNum; i++) {
            Future<String> f = service.submit(getJob(i));
            fList.add(f);
        }
        service.shutdown();
    }

    /**
     * other things
     */
    public void doOtherThings() {
        try {
            for (int i = 0; i < 3; i++) {
                System.out.println("do thing no:" + i);
                Thread.sleep(100 * (new Random().nextInt(10)));
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    /**
     * 从future中获取线程结果，打印结果
     * 
     * @param fList
     */
    public void getResult(List<Future<String>> fList) {
        ExecutorService service = Executors.newSingleThreadExecutor();
        service.execute(getCollectJob(fList));
        service.shutdown();
    }

    /**
     * 生成指定序号的线程对象
     * 
     * @param i
     * @return
     */
    public Callable<String> getJob(final int i) {
        final int time = new Random().nextInt(10);
        return new Callable<String>() {
            @Override
            public String call() throws Exception {
                Thread.sleep(1000 * time);
                return "thread-" + i;
            }
        };
    }

    /**
     * 生成结果收集线程对象
     * 
     * @param fList
     * @return
     */
    public Runnable getCollectJob(final List<Future<String>> fList) {
        return new Runnable() {
            public void run() {
                try {
                    int count = 0;
                    int[] flag = new int[fList.size()];
                    for (int i = 0; i < fList.size(); i = i % fList.size()) {
                        if (count == fList.size()) {
                            break;
                        }

                        if (fList.get(i).isDone() && !fList.get(i).isCancelled() && flag[i] == 0) {
                            // 优先处理已经结束的行程
                            System.out.println("Future:" + fList.get(i) + ",Result:" + fList.get(i).get());
                            // 计数器加1
                            count++;
                            // 已经执行过
                            flag[i] = 1;
                        }

                        i++;
                    }
                } catch (InterruptedException | ExecutionException e) {
                    e.printStackTrace();
                }
            }
        };
    }

}