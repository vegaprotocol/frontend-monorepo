resource "dnsimple_zone_record" "vega_trading" {
  zone_name = "vega.trading"
  name      = ""
  value     = format("https://%s.ipfs.cf-ipfs.com/", file("${path.module}/console-cid.txt"))
  type      = "URL"
  ttl       = 60
}
