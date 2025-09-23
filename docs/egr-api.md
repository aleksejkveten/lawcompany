# Поиск по части имени

GET "https://egr.gov.by/api/v2/egr/getShortInfoByRegName/{часть имени}



Обрати внимание, запрос может выполняться долго, необходимо ждать ответа.

[
{
"vfn": "Фактор-Сервис",
"ngrn": 390185783,
"dfrom": "2003-02-12T22:00:00.000+00:00",
"nsi00219": {
"vnsostk": "Действующий",
"nsi00219": 33512,
"nksost": 1
},
"vnaim": "Общество с ограниченной ответственностью \"Фактор-Сервис\"",
"vn": "ООО \"Фактор-Сервис\""
},
{
"vfn": "Лазерная мануфактура",
"ngrn": 791397355,
"dfrom": "2025-09-14T21:00:00.000+00:00",
"nsi00219": {
"vnsostk": "Действующий",
"nsi00219": 33512,
"nksost": 1
},
"vnaim": "Частное унитарное предприятие \"Лазерная мануфактура\"",
"vn": "Частное предприятие \"Лазерная мануфактура\""
},



# Поиск по УНП контактных данных

https://egr.gov.by/api/v2/egr/getAddressByRegNum/{regNum}

Особенности для внедрения - ngrn = {regNum}  - это уникальное поле
Данные адреса необходимо составить в одну строку, например, для примера ниже
220007, Минск, Фабрициуса, 7-12, телефон необходимо преобразовать в формат 375447022404 (убрать плюс, пробелы, скобки).

[
  {
    "cact": "string",
    "dfrom": "2025-09-17T12:58:13.852Z",
    "dto": "2025-09-17T12:58:13.852Z",
    "ngrn": 0,
    "nindex": 0,
    "nsi00201": {
      "nkstran": 0,
      "nsi00201": 0,
      "vnstranp": "string"
    },
    "nsi00202": {
      "nksoato": 0,
      "nsi00202": 0,
      "objectnumber": 0,
      "vnsfull": "string"
    },
    "nsi00226": {
      "nktul": 0,
      "nsi00226": 0,
      "vntulk": "string"
    },
    "nsi00227": {
      "nktpom": 0,
      "nsi00227": 0,
      "vntpomk": "string"
    },
    "nsi00234": {
      "nkvpom": 0,
      "nsi00234": 0,
      "vnvpom": "string"
    },
    "nsi00239": {
      "nktnp": 0,
      "nsi00239": 0,
      "vntnpk": "string"
    },
    "vadrprim": "string",
    "vdistrict": "string",
    "vdom": "string",
    "vemail": "string",
    "vfax": "string",
    "vkorp": "string",
    "vnp": "string",
    "vpom": "string",
    "vregion": "string",
    "vsite": "string",
    "vtels": "string",
    "vulitsa": "string"
  }
]
220007, Минск, Фабрициуса, 7-12
[
  {
    "ngrn": 191835044,
    "dfrom": "2024-03-25T21:00:00.000+00:00",
    "cact": "+",
    "nsi00201": {
      "nkstran": 112,
      "vnstranp": "Республика Беларусь",
      "nsi00201": 4881
    },
    "nindex": 220007,
    "nsi00202": {
      "vnsfull": "г. Минск Московский район",
      "objectnumber": 17033,
      "nsi00202": 344292,
      "nksoato": 5270000100
    },
    "vdistrict": "Московский",
    "nsi00239": {
      "nktnp": 1,
      "vntnpk": "г.",
      "nsi00239": 50607
    },
    "vnp": "Минск",
    "nsi00226": {
      "nktul": 1,
      "vntulk": "ул.",
      "nsi00226": 33295
    },
    "vulitsa": "Фабрициуса",
    "vdom": "7",
    "vpom": "12",
    "nsi00227": {
      "nktpom": 4,
      "vntpomk": "каб.",
      "nsi00227": 33302
    },
    "vemail": "info@fkm.by",
    "vtels": "+375 44 702-24-04",
    "nsi00234": {
      "nkvpom": 4,
      "vnvpom": "Нежилое помещение",
      "nsi00234": 36574
    },
    "vsite": "www.fkm.by"
  }
]
Выходные параметры 
Поле	Описание	Тип параметра	Тип	Обязательный
NGRN	Регномер	body	Integer	нет
DFROM	Дата начала действия записи	body	string	нет
DTO	Дата окончания действия записи	body	string	нет
CACT	Признак активности записи	body	string	нет
NSI00201	Страна 	body	TSI00201	нет
NINDEX	Индекс	body	Integer	нет
NSI00202	СОАТО	body	TSI00202	нет
VREGION	Область	body	string	нет
VDISTRICT	Район	body	string	нет
NSI00239	Тип населенного пункта	body	TSI00239	нет
VNP	Населенный пункт	body	String	нет
NSI00226	Вид элемента улично-дорожной сети	body	TSI00226	нет
VULITSA	Наименование элемента улично-дорожной сети	body	string	нет
VDOM	Номер дома	body	string	нет
VKORP	Номер корпуса	body	string	нет
VPOM	Номер помещения	body	String	нет
NSI00227	Тип помещения	body	TSI00227	нет
NSI00234	Вид помещения (ключ)	body	TSI00234	нет
VADRPRIM	Примечание к адресу	body	string	нет
VEMAIL	E-mail	body	string	нет
VSITE	Сайт	body	string	нет
VTELS	Телефоны	body	string	нет
VFAX	Факс	body	string	нет

# Поиск краткой информации по УНП

/v2/egr/getShortInfoByRegNum/{regNum}
[
  {
    "vfn": "Химчистка №1",
    "ngrn": 100049190,
    "dfrom": "1992-06-15T21:00:00.000+00:00",
    "nsi00219": {
      "vnsostk": "Действующий",
      "nsi00219": 33512,
      "nksost": 1
    },
    "vnaim": "Общество с дополнительной ответственностью \"Химчистка №1\"",
    "vn": "ОДО \"Химчистка №1\""
  }
]