(function (datepicker) {

        //var datepicker = jQuery.datepicker;
        datepicker.regional['es'] = {
            closeText: 'Cerrar',
            prevText: '&#x3C;Ant',
            nextText: 'Sig&#x3E;',
            currentText: 'Hoy',
            monthNames: [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
            ],
            monthNamesShort: [
                'ene', 'feb', 'mar', 'abr', 'may', 'jun',
                'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
            ],
            dayNames: ['domingo', 'lunes', 'martes', 'miÃ©rcoles', 'jueves', 'viernes', 'sÃ¡bado'],
            dayNamesShort: ['dom', 'lun', 'mar', 'miÃ©', 'jue', 'vie', 'sÃ¡b'],
            dayNamesMin: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            weekHeader: 'Sm',
            dateFormat: 'dd/mm/yy',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ''
        };
        datepicker.setDefaults(datepicker.regional['es']);

        return datepicker.regional['es'];
    }
)(jQuery.datepicker);