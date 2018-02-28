package zhangyuyao;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import zhangyuyao.generic.Parent;
import zhangyuyao.interfaces.IMessage;

/**
 * Hello world!
 */
public class App {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext(new String[] { "classpath:spring.xml" }, true, null);
        Parent parent = (Parent) context.getBean("paren");
        parent.say();

        System.out.println(IMessage.msg);
        IMessage.print1();
    }
}