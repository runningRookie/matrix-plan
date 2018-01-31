package zhangyuyao;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * Hello world!
 *
 */
public class App {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext(new String[] { "classpath:spring.xml" }, true, null);
        Demo demo = (Demo) context.getBean("demo");
        Example example = (Example) context.getBean("example");
        Foo foo = (Foo) context.getBean("foo");
        demo.say();
        example.say();
        foo.say();
    }
}
