(ns clojure-amqp-persistent.core
  (:require [langohr.core      :as rmq]
            [langohr.exchange  :as le]
            [langohr.channel   :as lch]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]
            [langohr.basic     :as lb])
)

(def amqp-conn
  (let [uri (get (System/getenv) "CLOUDAMQP_URL" "amqp://guest:guest@localhost")]
    (rmq/connect {:uri uri}))) ;; Connect to the broker


(defn ensure-fabric [channel exchange routing-key]
  (le/declare channel exchange "fanout" :durable true)
  (lq/declare channel routing-key :auto-delete false :exclusive false :durable true)
  (lq/bind channel routing-key exchange))

(defn publish-5 []
  (let [channel (lch/open amqp-conn)
        exchange "munin-persistent"
        routing-key "munin.random-messages"]
    (println "Trying to publish to a persistent queue.")
    (ensure-fabric channel exchange routing-key)
    (println "Publishing to" exchange)
    (loop [x 5]
      (when (> x 0)
        (lb/publish channel exchange routing-key (str "Saved for posterity: " x)
                    :persistent true
                    :content-type "text/plain")
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
      [op (first args)]
    (case op
      "sub" (sub-messages)
      "pub" (publish-5)
       (println "I don't know what to do!")
      )))
