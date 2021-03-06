import {expect} from 'chai'
import sinon from 'sinon'
import nfce from '../src/nfce.js'
import rs from '../src/secretarias/rs'
import parana from '../src/secretarias/parana'

const resolve = Promise.resolve.bind(Promise)

describe('NFCe', function () {
  describe('.consultar', function () {
    let link = 'dfeportal.fazenda.pr.gov.br/dfe-portal/rest/servico/consultaNFCe?chNFe=41160214953750000192650020000777871331742869'

    beforeEach(() => {
      sinon.stub(rs, 'consultar')
      sinon.stub(parana, 'consultar')
    })

    afterEach(() => {
      rs.consultar.restore()
      parana.consultar.restore()
    })

    it('delega para secretaria correta', function () {
      nfce.consultar(link)
      expect(parana.consultar.called).to.be.ok
    })

    it('combina resultado de varias secretarias', function () {
      nfce.registrar(/.*/, rs)
      rs.consultar.returns(resolve({valor: 'Valor RS'}))
      parana.consultar.returns(resolve({titulo: 'Nota Parana'}))

      return nfce.consultar(link).then(nota => {
        console.log('nota', nota)
        expect(nota).to.include({
          titulo: 'Nota Parana',
          valor: 'Valor RS'
        })
        expect(parana.consultar.called).to.be.ok
        expect(rs.consultar.called).to.be.ok
      })
    })
  })
})
