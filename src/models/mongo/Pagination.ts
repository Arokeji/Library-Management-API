// No es un modelo en si, pero lo separaremos para que la respuesta en los GET de Swagger de el dato y no la paginacion.

/**
 * @swagger
 * components:
 *   schemas:
 *     Pagination:
 *       type: object
 *       properties:
 *         totalItems:
 *           type: number
 *           description: Number of all the items contained
 *         totalPages:
 *           type: number
 *           description: Number of pages in total
 *         currentPage:
 *           type: number
 *           description: Current page number
 */
