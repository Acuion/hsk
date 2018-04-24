'use strict';

var partnersIter = 0;

var partnersInfo = [
    {
        pic: 'static/images/partners/poledance52.png',
        name: 'Pole Dance 52',
        link: 'https://vk.com/poledance52'
    },
    {
        pic: 'static/images/partners/salut.png',
        name: 'Салют Burgers',
        link: 'http://www.salutburgers.ru/'
    },
    {
        pic: 'static/images/partners/sovok.png',
        name: 'Совок',
        link: 'https://vk.com/sowokfood'
    },
    {
        pic: 'static/images/partners/photo.png',
        name: 'Елена Морокина',
        link: 'https://vk.com/elenamorokinafoto'
    },
    {
        pic: 'static/images/partners/portal.png',
        name: 'Портал-52',
        link: 'https://vk.com/portal52'
    },
    {
        pic: 'static/images/partners/lad.png',
        name: 'Ладъ',
        link: 'https://vk.com/centre_lad'
    },
    {
        pic: 'static/images/partners/eprint.png',
        name: 'ePrint shop',
        link: 'https://vk.com/eprint_group'
    },
    {
        pic: 'static/images/partners/makeup.png',
        name: 'Solovyva Tatiana',
        link: 'https://vk.com/id_solovyeva'
    },
    {
        pic: 'static/images/partners/bakery.png',
        name: 'Lilu Bakery',
        link: 'http://lilucake.ru/'
    }
]

function SetPartnerToSlot(partnerindex, slotindex) {
    $('#p' + slotindex + 'p').attr('src', partnersInfo[partnerindex].pic);
    $('#p' + slotindex + 't').attr('href', partnersInfo[partnerindex].link);
    $('#p' + slotindex + 't').html(partnersInfo[partnerindex].link);
}

function ShowSomePartners() {
    SetPartnerToSlot(partnersIter, 1);
    SetPartnerToSlot(partnersIter + 1, 2);
    SetPartnerToSlot(partnersIter + 2, 3);

    partnersIter = (partnersIter + 3) % partnersInfo.length;
}
