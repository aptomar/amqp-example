(ns clojure-amqp-persistent.core
    (:require
        [langohr.core      :as rmq]
        [langohr.exchange  :as le]
        [langohr.channel   :as lch]
        [langohr.queue     :as lq]
        [langohr.consumers :as lc]
        [langohr.basic     :as lb]))

(def amqp-conn
    (let [uri (get (System/getenv) "CLOUDAMQP_URL" "amqp://guest:guest@localhost")]
        (rmq/connect {:uri uri}))) ;; Connect to the broker

(defn ensure-fabric [channel exchange routing-key]
    (le/declare channel exchange "fanout" :durable true)
    (lq/declare channel routing-key :auto-delete false :exclusive false :durable true)
    (lq/bind channel routing-key exchange))

(defn publish-n [n]
    (let [channel (lch/open amqp-conn)
             exchange "munin-persistent"
             routing-key "munin.random-messages"]
        (println "Trying to publish to a persistent queue.")
        (ensure-fabric channel exchange routing-key)
        (println "Publishing to" exchange)
        (loop [x n]
            (when (> x 0)
                (let [msg (str "Saved for posterity: " (rand-int 100000))]
                    (println "Publishing message: " msg)
                    (lb/publish channel exchange routing-key msg
                        :persistent true
                        :content-type "text/plain"))
                (recur (dec x))))))

(defn sub-messages []
    (let [channel (lch/open amqp-conn)
             exchange "munin-persistent"
             routing-key "munin.random-messages"]
        (println "Trying to read stored messages.")
        (ensure-fabric channel exchange routing-key)
        (lc/subscribe channel routing-key (fn [ch metadata payload]
                                              (println (String. payload)))
            :auto-ack true)
        (println "Subscribing to" routing-key)))

(defn -main [& args]
    (let
        [op (first args)
            count (first (rest args))]
        (case op
            "sub" (do
                      (sub-messages)
                      (println "Waiting for messages to flush")
                      (Thread/sleep 5000))
            "pub" (publish-n (Integer/parseInt count))
            (println "I don't know what to do!")
            )
        (System/exit 0)))
