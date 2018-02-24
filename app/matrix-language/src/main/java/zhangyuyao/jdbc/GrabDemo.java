/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.jdbc;

import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * @author zyy43688
 * @version $Id: GrabDemo.java, v 0.1 2018年2月24日 下午2:27:31 zyy43688 Exp $
 */
public class GrabDemo {

    private static int count = 0;

    /**
     * 抢票
     */
    public synchronized void grab() {

        DBHelper dbQuery = new DBHelper("select * from test where id = 1");

        DBHelper dbUpdate = new DBHelper("update test set num = num - 1");

        System.out.println("当前链接数：" + (count += 2));

        try {
            ResultSet resultSet = dbQuery.getPst().executeQuery();

            int num = 0;

            while (resultSet.next()) {
                num = resultSet.getInt(2);
            }

            if (num > 0) {
                System.out.println(num);
                Thread.sleep(1000);
                dbUpdate.getPst().executeUpdate();
            }

        } catch (SQLException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}