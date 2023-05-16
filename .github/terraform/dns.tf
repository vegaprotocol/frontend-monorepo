resource "dnsimple_zone_record" "vega_trading" {
  zone_name = "vega.trading"
  name      = ""
  value     = file("${path.module}/mainnet-dns.txt")
  type      = "CNAME"
  ttl       = 60
}
