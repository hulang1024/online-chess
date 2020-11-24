package io.github.hulang1024.chinesechess.ws;

import io.netty.util.internal.shaded.org.jctools.queues.MessagePassingQueue.Consumer;
import org.yeauty.pojo.Session;

import java.util.ArrayList;
import java.util.List;

public class ClientSessionEventManager {
    private static List<Consumer<Session>> sessionCloseEventHandlers = new ArrayList<>();
    private static List<Consumer<Session>> sessionOpenEventHandlers = new ArrayList<>();

    public static void emitSessionCloseEvent(Session session) {
        sessionCloseEventHandlers.forEach(handler -> {
            handler.accept(session);
        });
    }

    public static void emitSessionOpenEvent(Session session) {
        sessionOpenEventHandlers.forEach(handler -> {
            handler.accept(session);
        });
    }

    public static void addSessionOpenEventHandler(Consumer<Session> handler) {
        sessionOpenEventHandlers.add(handler);
    }

    public static void addSessionCloseEventHandler(Consumer<Session> handler) {
        sessionCloseEventHandlers.add(handler);
    }
}
