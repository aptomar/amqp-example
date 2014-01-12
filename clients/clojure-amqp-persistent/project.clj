(defproject clojure-amqp-persistent "0.1.0-SNAPSHOT"
    :description "Simple example of running an AMQP client under clojure"
    :url "https://github.com/aptomar/amqp-example"
    :license {:name "Eclipse Public License"
                 :url "http://www.eclipse.org/legal/epl-v10.html"}
    :dependencies [[org.clojure/clojure "1.5.1"]
                   [com.novemberain/langohr "2.2.0"]
                   [org.clojure/tools.cli "0.3.1"]]
    :main ^:skip-aot clojure-amqp-persistent.core
    :target-path "target/%s"
    :profiles {:uberjar {:aot :all}})
