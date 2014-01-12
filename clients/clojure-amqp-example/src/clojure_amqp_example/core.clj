(ns clojure-amqp-example.core
  (:require [langohr.core      :as rmq]
            [langohr.exchange  :as le]
            [langohr.channel   :as lch]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]
            [langohr.basic     :as lb]))

(def amqp-conn
  (let [uri (get (System/getenv) "CLOUDAMQP_URL" "amqp://guest:guest@localhost")]
    (rmq/connect {:uri uri}))) ;; Connect to the broker

(defn publish-periodically []
  (.start (Thread.
           #(let [channel (lch/open amqp-conn)
                  exchange "munin"
                  routing-key "munin.heartbeat"]
              (le/declare channel exchange "fanout")
              (println "Publishing to" exchange)
              (loop [i 1]
                (lb/publish channel exchange routing-key (str "Lub-dub lub-dub " i))
                (Thread/sleep 1000)
                (recur (inc i)))))))

(defn print-messages []
  (let [channel (lch/open amqp-conn)
        exchange "munin"
        queue    "munin.heartbeat"]
    (lq/declare channel queue :auto-delete true :exclusive false)
    (lq/bind channel queue exchange)
    (lc/subscribe channel queue (fn [ch metadata payload]
                                  (println (String. payload)))
                  :auto-ack true)
    (println "Subscribing to" queue)))

(defn -main [& args]
  (publish-periodically)
  (print-messages))
